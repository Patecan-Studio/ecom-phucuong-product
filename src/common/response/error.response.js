const eComStatusCode = require("../statusCode/eComStatusCode");

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }

}

class ConflictRequestError extends ErrorResponse {
    constructor(message = eComStatusCode.ReasonPhrases.CONFLICT, status = eComStatusCode.StatusCodes.CONFLICT) {
        super(message, status);
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = eComStatusCode.ReasonPhrases.BAD_REQUEST,  status = eComStatusCode.StatusCodes.BAD_REQUEST) {
        super(message, status);
    }
}

class AuthFailureError extends ErrorResponse {
    constructor(message = eComStatusCode.ReasonPhrases.UNAUTHORIZED, status = eComStatusCode.StatusCodes.UNAUTHORIZED) {
        super(message, status);
    }
}

class ForbiddenError extends ErrorResponse {
    constructor(message = eComStatusCode.ReasonPhrases.FORBIDDEN, status = eComStatusCode.StatusCodes.FORBIDDEN) {
        super(message, status);
    }
}


class NotFoundError extends ErrorResponse {
    constructor(message = eComStatusCode.ReasonPhrases.NOT_FOUND, status = eComStatusCode.StatusCodes.NOT_FOUND) {
        super(message, status);
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    NotFoundError,
    AuthFailureError,
    ForbiddenError
}
