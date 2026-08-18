package com.rtx.placeintel.exception;

import com.rtx.placeintel.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;



@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {

        ApiResponse<Void> response = new ApiResponse<>(
                false,
                "Not Authorized",
                null,
                ex.getMessage()
        );


        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);

    }


    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {

        String message = String.format(
                "Invalid value '%s' for parameter '%s'",
                ex.getValue(),
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown"
        );

        ApiResponse<Void> response = new ApiResponse<>(
                false,
                "Something went wrong.",
                null,
                message
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }


    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {

        ApiResponse<Void> response = new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {


        ApiResponse<Void> response = new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {

        System.out.println("=============================================");
        System.out.println(ex.getMessage());

        ApiResponse<Void> response = new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<Void>> handleDuplicateResources(DuplicateResourceException ex) {


        ApiResponse<Void> response = new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFound ex) {


        ApiResponse<Void> response = new ApiResponse<>(
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
