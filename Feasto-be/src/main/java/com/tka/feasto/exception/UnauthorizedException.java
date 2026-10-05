// src/main/java/com/tka/feasto/exception/UnauthorizedException.java
package com.tka.feasto.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}