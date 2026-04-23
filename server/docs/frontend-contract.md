# Frontend Contract

## Pet Images

Pet images are uploaded to Cloudinary by the backend. Frontend clients must not write
`imageUrl` directly through pet create or update JSON requests.

### Pet Shape

Pet responses keep `imageUrl` for display compatibility and include Cloudinary metadata
under `image`.

```json
{
  "id": "pet_id",
  "name": "Milo",
  "type": "Dog",
  "breed": "Corgi",
  "age": 3,
  "ownerId": "user_id",
  "imageUrl": "https://res.cloudinary.com/...",
  "image": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "petmatch/pets/...",
    "assetId": "...",
    "version": 123,
    "format": "jpg",
    "resourceType": "image",
    "bytes": 123456,
    "width": 1200,
    "height": 900,
    "originalFilename": "milo",
    "uploadedAt": "2026-04-20T00:00:00.000Z"
  }
}
```

Rows that have `imageUrl` but no `image.publicId` are treated as legacy/external
images. The backend can clear the stored URL, but it cannot delete a Cloudinary
asset without a stored public id.

### Create Or Update Pet

`POST /api/pets` and `PATCH /api/pets/:petId` accept JSON profile fields only:

```json
{
  "name": "Milo",
  "type": "Dog",
  "breed": "Corgi",
  "age": 3
}
```

### Upload Or Replace Image

`POST /api/pets/:petId/image`

- Auth required.
- Body: `multipart/form-data`
- File field: `image`
- Accepted types: JPEG, PNG, WebP, GIF.
- Max size: 5MB.
- Returns the updated pet.
- If the new image is saved but cleanup of the previous Cloudinary asset fails,
  the response remains `200` and includes `oldImageDeleteStatus: "failed"` in
  `data`.
- If another request changes the pet image during upload, returns `409` and the
  client should retry.

### Delete Image

`DELETE /api/pets/:petId/image`

- Auth required.
- Clears stored image metadata, then attempts to delete the Cloudinary asset.
- Returns the updated pet.
- If the metadata is cleared but Cloudinary cleanup fails, the response remains
  `200` and includes `imageDeleteStatus: "failed"` in `data`.
- If another request changes the pet image during deletion, returns `409` and the
  client should retry.

### Error Notes

- `400`: missing file or invalid image type.
- `413`: image is larger than 5MB.
- `404`: pet does not exist or is not owned by the current user.
- `409`: pet image changed during an image mutation; retry the operation.
- `502`: Cloudinary upload failed.

## Conversations And Messages

Conversations are created by the backend when a mutual pet match is created.
Frontend clients must not send a sender id; the backend uses the authenticated
user from the JWT.

### Conversation Shape

```json
{
  "id": "conversation_id",
  "matchId": "match_id",
  "createdAt": "2026-04-23T00:00:00.000Z",
  "updatedAt": "2026-04-23T00:00:00.000Z",
  "match": {
    "id": "match_id",
    "petIds": ["pet_1", "pet_2"],
    "createdAt": "2026-04-23T00:00:00.000Z",
    "currentPet": {
      "id": "pet_1",
      "name": "Milo",
      "type": "Dog",
      "breed": "Corgi",
      "age": 3,
      "imageUrl": "https://res.cloudinary.com/...",
      "primaryImage": {
        "url": "https://res.cloudinary.com/..."
      }
    },
    "otherPet": {
      "id": "pet_2",
      "name": "Luna",
      "type": "Cat",
      "breed": "Tabby",
      "age": 2,
      "imageUrl": null,
      "primaryImage": null
    }
  },
  "lastMessage": null
}
```

### Message Shape

```json
{
  "id": "message_id",
  "conversationId": "conversation_id",
  "senderUserId": "user_id",
  "body": "Hi there!",
  "createdAt": "2026-04-23T00:00:00.000Z"
}
```

### List Conversations

`GET /api/conversations`

- Auth required.
- Returns conversations for matches involving one of the authenticated user's
  pets.
- Conversations are ordered by most recently updated first.

### List Match Messages

`GET /api/matches/:matchId/messages`

- Auth required.
- Only users who own one of the matched pets can access messages.
- Returns `404` when the match does not exist or is not accessible to the
  authenticated user.
- Messages are ordered oldest first.

### Send Match Message

`POST /api/matches/:matchId/messages`

- Auth required.
- Only users who own one of the matched pets can send messages.
- Request JSON:

```json
{
  "body": "Hi there!"
}
```

- `body` is trimmed, required, and limited to 2000 characters.
- Returns the created message.
- Returns `404` when the match does not exist or is not accessible to the
  authenticated user.
