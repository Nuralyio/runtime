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

@ApplicationScoped
@Transactional
public class Deployment {

    @Inject
    com.nuraly.functions.configuration.Configuration configuration;

    public void deploy(Long functionId) throws FunctionNotFoundException {
        // Trouver l'entité FunctionEntity par son ID
        FunctionEntity functionEntity = FunctionEntity.findById(functionId);
        if (functionEntity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + functionId);
        }

        // Préparer le nom de la fonction et l'URL de l'image
        String functionName = functionEntity.getLabel().toLowerCase() + "-" + functionEntity.id;
        String imageUrl = configuration.RegistryURL + "/" + functionEntity.getLabel() + "-" + functionEntity.id;

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

        } catch (ApiException | IOException e) {
            System.err.println("Error creating or managing Knative service: " + e.getMessage());
            e.printStackTrace();
        }
    }
}