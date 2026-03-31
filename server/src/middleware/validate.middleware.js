function validate(schema) {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      req.body = validatedData.body;
      req.params = validatedData.params;
      req.query = validatedData.query;

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = validate;
