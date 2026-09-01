package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.ResourceRequest;
import com.rtx.placeintel.dto.ResourceResponse;
import com.rtx.placeintel.entity.Company;
import com.rtx.placeintel.entity.Resource;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.CompanyRepository;
import com.rtx.placeintel.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResourceService {


    private final ResourceRepository resourceRepository;
    private final CompanyRepository companyRepository;



    @Transactional
    public ApiResponse<ResourceResponse> addResource(UUID companyId, ResourceRequest req, User tpo) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFound("Company not found: " + companyId));

        Resource resource = Resource.builder()
                .company(company)
                .type(req.resourceType())
                .title(req.title())
                .url(req.url())
                .addedByTpo(tpo)
                .build();

       ResourceResponse response = toResponse(resourceRepository.save(resource));

       return new ApiResponse<>(
               true,
               "Successfully added the resource",
               response,
               null
       );
    }





    @Transactional
    public ApiResponse<String> deleteResource(UUID resourceId) {
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResourceNotFound("Resource not found: " + resourceId);
        }
        resourceRepository.deleteById(resourceId);

        return new ApiResponse<>(
                true,
                "Successfully deleted the resource",
                null,
                null
        );
    }





    public ApiResponse<List<ResourceResponse>> getCompanyResources(UUID companyId) {
        List<ResourceResponse> response = resourceRepository.findByCompanyId(companyId)
                .stream()
                .map(this::toResponse)
                .toList();

        return new ApiResponse<>(
                true,
                "Successfully fetched the resources",
                response,
                null
        );
    }



    @Transactional
    public ApiResponse<List<ResourceResponse>> addResourcesBulk(UUID companyId, List<ResourceRequest> requests, User tpo) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFound("Company not found: " + companyId));

        /*
        * Taking a list of requests and converting each request into a Resource object,
        * then collecting all those objects into a List<Resource>.
        * */
        List<Resource> resources = requests.stream()
                .map(req -> Resource.builder()
                        .company(company)
                        .type(req.resourceType())
                        .title(req.title())
                        .url(req.url())
                        .addedByTpo(tpo)
                        .build())
                .toList();

        List<ResourceResponse> saved = resourceRepository.saveAll(resources)
                .stream()
                .map(this::toResponse)
                .toList();

        return new ApiResponse<>(
                true,
                saved.size() + " resources added", saved,
                null
        );
    }



    // ------- Helper Method ---------
    public ResourceResponse toResponse(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getType(),
                resource.getTitle(),
                resource.getUrl(),
                resource.getCreatedAt()
        );
    }
}