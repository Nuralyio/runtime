package com.nuraly.docgen.dto.mapper;

import com.nuraly.docgen.dto.TemplateDTO;
import com.nuraly.docgen.entity.TemplateEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "cdi")
public interface TemplateDTOMapper {

    TemplateDTO toDTO(TemplateEntity entity);

    List<TemplateDTO> toDTOList(List<TemplateEntity> entities);
}
