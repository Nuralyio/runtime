package com.nuraly.functions.service;

import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.exception.FunctionNotFoundException;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.Configuration;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import io.kubernetes.client.util.Config;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class Deployment {

    @Inject
    com.nuraly.functions.configuration.Configuration configuration;

    public void deploy(UUID functionId) throws FunctionNotFoundException {
        // Trouver l'entité FunctionEntity par son ID
        FunctionEntity functionEntity = FunctionEntity.findById(functionId);
        if (functionEntity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + functionId);
        }

        // Préparer le nom de la fonction et l'URL de l'image
        // Replace underscores with hyphens to comply with Kubernetes RFC 1123 naming
        String functionName = functionEntity.getLabel().toLowerCase().replace("_", "-") + "-" + functionEntity.id;
        String imageUrl = configuration.RegistryURL + "/" + functionEntity.getLabel().toLowerCase().replace("_", "-") + "-" + functionEntity.id;

        try {
            // Charger le fichier YAML de la ressource
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("knative-service.yaml");
            if (inputStream == null) {
                throw new IOException("knative-service.yaml not found in resources.");
            }
            String knativeServiceYaml = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);

            // Remplacer les variables dans le template
            knativeServiceYaml = knativeServiceYaml
                    .replace("${functionName}", functionName)
                    .replace("${image}", imageUrl);

            System.out.println("Modified Knative Service YAML:\n" + knativeServiceYaml);

            // Convertir le YAML en Map
            Yaml yaml = new Yaml();
            Map<String, Object> knativeServiceMap = yaml.load(knativeServiceYaml);

            // Configurer le client Kubernetes
            ApiClient client = Config.defaultClient();
            Configuration.setDefaultApiClient(client);

            // Instancier l'API pour interagir avec les Custom Resources (CRDs)
            CustomObjectsApi api = new CustomObjectsApi();

            // Vérifier si le service existe déjà
            try {
                api.getNamespacedCustomObject(
                        "serving.knative.dev",
                        "v1",
                        "default",  // Namespace
                        "services", // Nom du CRD
                        functionName // Identifiant de la fonction
                );

                // Si le service existe, le supprimer
                System.out.println("Knative service '" + functionName + "' exists, deleting...");
                api.deleteNamespacedCustomObject(
                        "serving.knative.dev",
                        "v1",
                        "default",  // Namespace
                        "services", // Nom du CRD
                        functionName,  // Identifiant
                        null, null, null, null, null
                );
                System.out.println("Knative service '" + functionName + "' deleted successfully.");
            } catch (ApiException e) {
                if (e.getCode() != 404) {
                    // Gérer les autres erreurs
                    System.err.println("Error checking Knative service: " + e.getMessage());
                    e.printStackTrace();
                    return;
                }
            }

            // Créer le service Knative
            System.out.println("Creating Knative service '" + functionName + "'...");
            api.createNamespacedCustomObject(
                    "serving.knative.dev",
                    "v1",
                    "default",  // Namespace
                    "services", // Nom du CRD
                    knativeServiceMap,  // Définition du service
                    null, null, null
            );

            System.out.println("Knative service '" + functionName + "' created successfully.");

        } catch (ApiException e) {
            System.err.println("Error creating or managing Knative service: " + e.getMessage());
            System.err.println("Response code: " + e.getCode());
            System.err.println("Response body: " + e.getResponseBody());
            // Parse error message from response body if available
            String errorMsg = "Deployment failed";
            if (e.getResponseBody() != null && e.getResponseBody().contains("message")) {
                try {
                    // Extract message from JSON response
                    String body = e.getResponseBody();
                    int msgStart = body.indexOf("\"message\":\"") + 11;
                    int msgEnd = body.indexOf("\"", msgStart);
                    if (msgStart > 10 && msgEnd > msgStart) {
                        errorMsg = body.substring(msgStart, msgEnd);
                    }
                } catch (Exception parseEx) {
                    errorMsg = "Kubernetes API error: " + e.getCode();
                }
            }
            throw new RuntimeException(errorMsg, e);
        } catch (IOException e) {
            System.err.println("IO Error creating or managing Knative service: " + e.getMessage());
            throw new RuntimeException("Failed to read Knative service configuration: " + e.getMessage(), e);
        }
    }
}