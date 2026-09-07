package com.rtx.placeintel.exception;

public class UserAlreadyExistsException extends DuplicateResourceException {

    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
