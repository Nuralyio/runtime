package com.nuraly.functions.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.BuildImageResultCallback;
import com.github.dockerjava.api.exception.DockerException;
import com.github.dockerjava.api.model.AuthConfig;
import com.github.dockerjava.api.model.BuildResponseItem;
import com.github.dockerjava.api.model.PushResponseItem;
import com.github.dockerjava.core.DockerClientBuilder;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.command.PushImageResultCallback;
import com.nuraly.functions.configuration.Configuration;
import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.exception.ImageBuildError;
import com.nuraly.functions.exception.ImagePublishError;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.*;
import java.util.Set;

/**
 * Manages the building and publishing of Docker images for function entities.
 * <p>
 * This class includes methods for:
 * <ul>
 *     <li>Building a Docker image from a function entity template.</li>
 *     <li>Pushing the built Docker image to a registry.</li>
 * </ul>
 */
@ApplicationScoped
@Transactional
public class ContainerManager {

    @Inject
    Configuration configuration;

    private final DockerClient dockerClient;
    private AuthConfig authConfig;

    /**
     * Initializes the Docker client with default configuration.
     */
    public ContainerManager() {
        DefaultDockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder().build();
        this.dockerClient = DockerClientBuilder.getInstance(config).build();
    }

    /**
     * Builds a Docker image using the specified function entity.
     * <p>
     * This method copies the function entity template to a temporary directory, writes the function's handler,
     * and builds the Docker image. After building, it pushes the image to the registry.
     *
     * @param functionEntity The function entity for which the Docker image is to be built.
     * @return The image ID of the successfully built Docker image.
     * @throws DockerException If an error occurs during the Docker build process.
     * @throws ImageBuildError If the build fails due to a specific issue.
     */
    public String buildDockerImage(FunctionEntity functionEntity) throws ImageBuildError {
        // Define the base path for the function
        Path functionBasePath = Paths.get(configuration.FunctionsBasePath, functionEntity.getTemplate());

        // Define a temporary directory for the modified function
        Path tempFunctionDir = Paths.get(System.getProperty("java.io.tmpdir"), "function_" + functionEntity.id);
        try {
            // Copy the template directory to a temporary folder
            Files.walk(functionBasePath)
                    .forEach(source -> {
                        Path destination = tempFunctionDir.resolve(functionBasePath.relativize(source));
                        try {
                            if (Files.isDirectory(source)) {
                                Files.createDirectories(destination);
                            } else {
                                Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
                            }
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    });

            File handlerFile = tempFunctionDir.resolve("handler.ts").toFile();
            try (FileWriter writer = new FileWriter(handlerFile)) {
                writer.write(functionEntity.getHandler());
            }

            // Build the Docker image
            String imageName = configuration.RegistryURL + "/" + functionEntity.getLabel().toLowerCase() + "-" + functionEntity.id + ":latest";
            String imageId = dockerClient.buildImageCmd()
                    .withDockerfile(tempFunctionDir.resolve("Dockerfile").toFile())
                    .withTags(Set.of(imageName))
                    .withBaseDirectory(tempFunctionDir.toFile())
                    .exec(new BuildImageResultCallback() {
                        @Override
                        public void onNext(BuildResponseItem item) {
                            super.onNext(item);
                            System.out.println(item.getStream()); // Logs build output
                        }
                    })
                    .awaitImageId();

            System.out.println("Docker image built successfully: " + imageId);

            // Call the push method and check if it was successful
            boolean isPushSuccessful = pushDockerImage(imageName);
            if (isPushSuccessful) {
                System.out.println("Docker image pushed successfully: " + imageName);
            } else {
                System.out.println("Docker image push failed: " + imageName);
            }

            return imageId;
        } catch (Exception e) {
            throw new ImageBuildError("Failed to build Docker image for " + functionEntity.getLabel());
        } finally {
            // Delete the temporary directory after the build process
            try {
                Files.walk(tempFunctionDir)
                        .map(Path::toFile)
                        .forEach(File::delete);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Pushes the Docker image to the registry after it has been built.
     * <p>
     * This method uses the configured credentials to authenticate and push the Docker image.
     *
     * @param imageName The name of the image to be pushed.
     * @return true if the push is successful, false otherwise.
     * @throws DockerException If an error occurs during the Docker push process.
     * @throws ImagePublishError If the push fails due to a specific issue.
     */
    public boolean pushDockerImage(String imageName) throws ImagePublishError {
        try {
            this.authConfig = new AuthConfig()
                    .withUsername(configuration.RegistryUsername)
                    .withPassword(configuration.RegistryPassword)
                    .withRegistryAddress(configuration.RegistryURL);

            // Push the Docker image to the registry and wait for the push to finish
            dockerClient.pushImageCmd(imageName)
                    .withAuthConfig(authConfig)
                    .exec(new PushImageResultCallback() {
                        public void onNext(PushResponseItem item) {
                            super.onNext(item);
                            System.out.println(item.getStream()); // Logs push output
                        }
                    })
                    .awaitCompletion(); // This waits for the push to complete

            System.out.println("Docker image pushed successfully: " + imageName);
            return true; // Return true if push is successful
        } catch (Exception e) {
            System.err.println("Error during Docker image push: " + e.getMessage());
            return false; // Return false if an error occurs
        }
    }
}