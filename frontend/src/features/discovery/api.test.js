import { getDiscoveryPets } from './api';

function mockApiResponse(data) {
  global.fetch.mockResolvedValueOnce({
    json: async () => ({ success: true, data }),
    ok: true
  });
}

describe('discovery api', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('passes discovery filters to the backend', async () => {
    mockApiResponse([{ id: 'pet-1' }]);

    await expect(getDiscoveryPets('token-1', {
      breed: 'Corgi',
      cursor: 'pet-0',
      fromPetId: 'source-pet',
      limit: 10,
      maxAge: 6,
      minAge: 1,
      size: 'MEDIUM',
      type: 'Dog',
      withPhotos: true
    })).resolves.toEqual([{ id: 'pet-1' }]);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/discovery?limit=10&cursor=pet-0&fromPetId=source-pet&type=Dog&breed=Corgi&minAge=1&maxAge=6&size=MEDIUM&withPhotos=true',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-1'
        })
      })
    );
  });
});
