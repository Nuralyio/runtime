package com.nuraly.workflows.messaging;

import com.nuraly.workflows.configuration.Configuration;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

@ApplicationScoped
public class RabbitMQConnectionManager {

    private static final Logger LOG = Logger.getLogger(RabbitMQConnectionManager.class);

    @Inject
    Configuration configuration;

    private Connection connection;
    private final Object connectionLock = new Object();

    void onStart(@Observes @Priority(1) StartupEvent ev) {
        try {
            initializeConnection();
            declareExchangeAndQueues();
            LOG.info("RabbitMQ connection initialized successfully");
        } catch (Exception e) {
            LOG.error("Failed to initialize RabbitMQ connection: " + e.getMessage(), e);
        }
    }

    void onStop(@Observes ShutdownEvent ev) {
        closeConnection();
    }

    private void initializeConnection() throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(configuration.rabbitmqHost);
        factory.setPort(configuration.rabbitmqPort);
        configuration.rabbitmqUsername.ifPresent(factory::setUsername);
        configuration.rabbitmqPassword.ifPresent(factory::setPassword);
        factory.setAutomaticRecoveryEnabled(true);
        factory.setNetworkRecoveryInterval(5000);

        this.connection = factory.newConnection();
    }

    private void declareExchangeAndQueues() throws IOException, TimeoutException {
        try (Channel channel = connection.createChannel()) {
            // Declare direct exchange
            channel.exchangeDeclare(configuration.rabbitmqExchange, "direct", true);

            // Declare executions queue (durable, with dead-letter queue)
            channel.queueDeclare(configuration.rabbitmqExecutionsQueue, true, false, false, null);
            channel.queueBind(configuration.rabbitmqExecutionsQueue, configuration.rabbitmqExchange,
                    configuration.rabbitmqExecutionsRoutingKey);

            // Declare events queue
            channel.queueDeclare(configuration.rabbitmqEventsQueue, true, false, false, null);
            channel.queueBind(configuration.rabbitmqEventsQueue, configuration.rabbitmqExchange, "workflow.event");

            LOG.info("RabbitMQ exchange and queues declared successfully");
        }
    }

    public Connection getConnection() {
        synchronized (connectionLock) {
            if (connection == null || !connection.isOpen()) {
                try {
                    initializeConnection();
                } catch (Exception e) {
                    LOG.error("Failed to reconnect to RabbitMQ: " + e.getMessage(), e);
                    throw new RuntimeException("Failed to connect to RabbitMQ", e);
                }
            }
            return connection;
        }
    }

    public Channel createChannel() throws IOException {
        return getConnection().createChannel();
    }

    private void closeConnection() {
        synchronized (connectionLock) {
            if (connection != null && connection.isOpen()) {
                try {
                    connection.close();
                    LOG.info("RabbitMQ connection closed");
                } catch (IOException e) {
                    LOG.error("Error closing RabbitMQ connection: " + e.getMessage(), e);
                }
            }
        }
    }
}
