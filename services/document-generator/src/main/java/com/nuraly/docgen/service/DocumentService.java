package com.nuraly.docgen.service;

import com.deepoove.poi.XWPFTemplate;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.docgen.configuration.DocgenConfiguration;
import com.nuraly.docgen.dto.GenerateRequest;
import com.nuraly.docgen.dto.GenerateResponse;
import com.nuraly.docgen.dto.TemplateDTO;
import com.nuraly.docgen.dto.mapper.TemplateDTOMapper;
import com.nuraly.docgen.entity.GenerationJobEntity;
import com.nuraly.docgen.entity.TemplateEntity;
import com.nuraly.docgen.entity.enums.JobStatus;
import com.nuraly.docgen.exception.TemplateNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class DocumentService {

    private static final Logger LOG = Logger.getLogger(DocumentService.class);

    @Inject
    DocgenConfiguration config;

    @Inject
    TemplateDTOMapper templateMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public TemplateDTO uploadTemplate(String name, String description, String applicationId,
                                      String createdBy, InputStream fileStream, String fileName) throws IOException {
        Path templatesDir = Paths.get(config.uploadPath, "templates");
        Files.createDirectories(templatesDir);

        String storedName = UUID.randomUUID() + "_" + fileName;
        Path filePath = templatesDir.resolve(storedName);
        Files.copy(fileStream, filePath, StandardCopyOption.REPLACE_EXISTING);

        TemplateEntity entity = new TemplateEntity();
        entity.name = name;
        entity.description = description;
        entity.filePath = filePath.toString();
        entity.applicationId = applicationId;
        entity.createdBy = createdBy;
        entity.persist();

        LOG.infof("Template uploaded: %s (id=%s)", name, entity.id);
        return templateMapper.toDTO(entity);
    }

    public List<TemplateDTO> getTemplates(String applicationId) {
        List<TemplateEntity> entities;
        if (applicationId != null && !applicationId.isEmpty()) {
            entities = TemplateEntity.list("applicationId", applicationId);
        } else {
            entities = TemplateEntity.listAll();
        }
        return templateMapper.toDTOList(entities);
    }

    public TemplateDTO getTemplate(UUID id) {
        TemplateEntity entity = TemplateEntity.findById(id);
        if (entity == null) {
            throw new TemplateNotFoundException(id);
        }
        return templateMapper.toDTO(entity);
    }

    @Transactional
    public void deleteTemplate(UUID id) {
        TemplateEntity entity = TemplateEntity.findById(id);
        if (entity == null) {
            throw new TemplateNotFoundException(id);
        }
        try {
            Files.deleteIfExists(Paths.get(entity.filePath));
        } catch (IOException e) {
            LOG.warnf("Failed to delete template file: %s", entity.filePath);
        }
        entity.delete();
        LOG.infof("Template deleted: %s", id);
    }

    @Transactional
    public Path generate(GenerateRequest request) throws IOException {
        TemplateEntity template = TemplateEntity.findById(request.getTemplateId());
        if (template == null) {
            throw new TemplateNotFoundException(request.getTemplateId());
        }

        Path outputDir = Paths.get(config.uploadPath, "generated");
        Files.createDirectories(outputDir);

        String outputFileName = UUID.randomUUID() + ".docx";
        Path outputPath = outputDir.resolve(outputFileName);

        XWPFTemplate rendered = XWPFTemplate.compile(template.filePath).render(request.getData());
        rendered.writeToFile(outputPath.toString());
        rendered.close();

        LOG.infof("Document generated: %s from template %s", outputFileName, template.id);
        return outputPath;
    }

    @Transactional
    public GenerationJobEntity createJob(UUID templateId, Map<String, Object> data,
                                         String callbackId, String applicationId, String userId) throws Exception {
        TemplateEntity template = TemplateEntity.findById(templateId);
        if (template == null) {
            throw new TemplateNotFoundException(templateId);
        }

        GenerationJobEntity job = new GenerationJobEntity();
        job.template = template;
        job.status = JobStatus.PENDING;
        job.inputData = objectMapper.writeValueAsString(data);
        job.callbackId = callbackId;
        job.applicationId = applicationId;
        job.createdBy = userId;
        job.persist();

        return job;
    }

    @Transactional
    public GenerationJobEntity processJob(UUID jobId) {
        GenerationJobEntity job = GenerationJobEntity.findById(jobId);
        if (job == null) {
            LOG.errorf("Job not found: %s", jobId);
            return null;
        }

        job.status = JobStatus.PROCESSING;
        job.persist();

        try {
            Map<String, Object> data = objectMapper.readValue(job.inputData, new TypeReference<>() {});

            GenerateRequest request = new GenerateRequest();
            request.setTemplateId(job.template.id);
            request.setData(data);

            Path outputPath = generate(request);
            job.outputPath = outputPath.toString();
            job.status = JobStatus.COMPLETED;
            job.completedAt = Instant.now();
            job.persist();

            LOG.infof("Job completed: %s, output: %s", jobId, outputPath.getFileName());
        } catch (Exception e) {
            job.status = JobStatus.FAILED;
            job.error = e.getMessage();
            job.completedAt = Instant.now();
            job.persist();
            LOG.errorf("Job failed: %s, error: %s", jobId, e.getMessage());
        }

        return job;
    }

    public GenerateResponse getJob(UUID jobId) {
        GenerationJobEntity job = GenerationJobEntity.findById(jobId);
        if (job == null) {
            return null;
        }

        String fileUrl = null;
        if (job.outputPath != null) {
            fileUrl = "/api/v1/documents/files/" + Paths.get(job.outputPath).getFileName().toString();
        }

        return new GenerateResponse(job.id, job.status.name(), fileUrl);
    }
}
