function validate(schema) {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      req.validated = validatedData;
      req.body = validatedData.body;
      req.params = validatedData.params;
      Object.keys(req.query).forEach((key) => {
        delete req.query[key];
      });
      Object.assign(req.query, validatedData.query);

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = validate;
