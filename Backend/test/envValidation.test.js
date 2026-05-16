const { validateEnvironmentVariables, runtimeEnvCheck } = require('../middleware/envValidation');

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('envValidation', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('passes validation when required environment variables are present', () => {
    expect(() => validateEnvironmentVariables()).not.toThrow();
  });

  it('fails startup when OPENAI_API_KEY is missing', () => {
    delete process.env.OPENAI_API_KEY;
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit:${code}`);
    });

    expect(() => validateEnvironmentVariables()).toThrow('process.exit:1');
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });

  it('returns 503 in development when critical runtime env is missing', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.MONGO_URI;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    runtimeEnvCheck({}, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'ENV_CONFIG_ERROR',
    }));
    expect(next).not.toHaveBeenCalled();
  });
});
