function responseMeta(correlationId) {
  return {
    correlationId,
    timestamp: new Date().toISOString()
  };
}

function envelope(data, correlationId, extraMeta = {}) {
  return {
    data,
    meta: {
      ...responseMeta(correlationId),
      ...extraMeta
    }
  };
}

function errorResponse(code, message, correlationId) {
  return {
    error: {
      code,
      message,
      correlationId
    }
  };
}

module.exports = {
  envelope,
  errorResponse,
  responseMeta
};
