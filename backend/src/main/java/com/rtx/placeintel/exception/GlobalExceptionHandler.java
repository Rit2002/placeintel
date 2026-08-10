package com.rtx.placeintel.exception;

import com.rtx.placeintel.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse> handleBadCredentials(BadCredentialsException ex) {

        ApiResponse response = new ApiResponse(
                false,
                "Something went wrong.",
                null,
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidationException(MethodArgumentNotValidException ex) {


        ApiResponse response = new ApiResponse(
                false,
                "Something went wrong.",
                null,
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception ex) {

        System.out.println("=============================================");
        System.out.println(ex.getMessage());

        ApiResponse response = new ApiResponse(
                false,
                "Something went wrong.",
                null,
                "INTERNAL_SERVER_ERROR"
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }


    @ExceptionHandler({UserAlreadyExistsException.class, DuplicateResourceException.class})
    public ResponseEntity<ApiResponse> handleDuplicateResources(DuplicateResourceException ex) {


        ApiResponse response = new ApiResponse(
                false,
                "Something went wrong.",
                null,
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);

    }


    @ExceptionHandler
    public ResponseEntity<ApiResponse> handleResourceNotFound(ResourceNotFound ex) {


        ApiResponse response = new ApiResponse(
                false,
                "Something went wrong.",
                null,
                ex.getMessage()
        );


        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

}
