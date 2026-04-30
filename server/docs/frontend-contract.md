# Frontend Contract

## Health

`GET /health` and `GET /api/health`

- Auth not required.
- Returns `200` when the API can reach the database.
- Returns `503` when the service or database is unavailable.

## Auth

### Current User

`GET /api/auth/me`

- Auth required.
- Returns the authenticated user without password data.
- Returns `401` when the token is missing, invalid, expired, or points to a
  deleted user.

### Update Current User

`PATCH /api/auth/me`

- Auth required.
- Accepts one or more owner profile fields:

```json
{
  "fullName": "Alex Rivera",
  "phoneNumber": "+15551001001",
  "bio": "Weekend park regular who likes relaxed meetups.",
  "city": "Melbourne"
}
```

- `location` is accepted as an alias for `city`.
- Returns the updated user. User responses include `city` and `location` with
  the same value for compatibility.
- Returns `400` when the phone number is already used by another account.

## Discovery And Interactions

### Discovery

`GET /api/discovery?fromPetId=pet_id&limit=10&cursor=last_pet_id&type=Dog&breed=Corgi&minAge=1&maxAge=6&size=MEDIUM&withPhotos=true`

- Auth required.
- `fromPetId` is optional for backwards compatibility. When provided, discovery
  excludes pets already liked or passed by that selected pet only.
- `cursor` is optional and returns pets with ids after the cursor in the stable
  feed order.
- `type` is optional and filters by pet type using a case-insensitive exact
  match.
- `breed` is optional and filters by breed using a case-insensitive contains
  match.
- `minAge` and `maxAge` are optional inclusive age bounds. When both are
  provided, `minAge` must be less than or equal to `maxAge`.
- `size` is optional and must be one of `SMALL`, `MEDIUM`, `LARGE`, or
  `EXTRA_LARGE`.
- `withPhotos=true` is optional and returns only pets with a non-empty image
  URL.
- The frontend should pass the currently selected user pet as `fromPetId`.
- Discovery pet responses include profile fields and a lightweight `owner`
  object for display:

```json
{
  "id": "pet_id",
  "name": "Milo",
  "type": "Dog",
  "breed": "Corgi",
  "age": 3,
  "bio": "Friendly park regular.",
  "gender": "MALE",
  "size": "MEDIUM",
  "temperament": ["Friendly", "Playful"],
  "city": "Melbourne",
  "location": "Melbourne",
  "owner": {
    "id": "user_id",
    "fullName": "Alex Rivera",
    "bio": "Weekend park regular.",
    "city": "Melbourne",
    "location": "Melbourne"
  }
}
```

### Duplicate Interactions

`POST /api/interactions`

- A selected pet can only respond to a target pet once.
- Repeating the same interaction is idempotent and returns the existing result.
- Trying to change an existing response, such as pass to like, returns `409`.

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
  "bio": "Friendly park regular.",
  "gender": "MALE",
  "size": "MEDIUM",
  "temperament": ["Friendly", "Playful"],
  "city": "Melbourne",
  "location": "Melbourne",
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
  "age": 3,
  "bio": "Friendly park regular.",
  "gender": "MALE",
  "size": "MEDIUM",
  "temperament": ["Friendly", "Playful"],
  "city": "Melbourne"
}
```

- `gender` values: `MALE`, `FEMALE`, `UNKNOWN`.
- `size` values: `SMALL`, `MEDIUM`, `LARGE`, `EXTRA_LARGE`.
- `temperament` accepts up to 10 text values, each 40 characters or fewer.
- `location` is accepted as an alias for `city`.

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

Frontend clients should show `oldImageDeleteStatus: "failed"` or
`imageDeleteStatus: "failed"` as a cleanup warning, not as a failed pet save.

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
  "lastMessage": null,
  "lastMessagePreview": null,
  "latestMessageAt": null,
  "lastReadAt": null,
  "unreadCount": 0,
  "hasUnread": false
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
- Listing conversations is read-only. Conversations are created when matches are
  created or when the first message is sent for an older match.
- Conversations are ordered by most recently updated first.
- `lastMessage` contains the newest message in the conversation, or `null` when
  no messages have been sent.
- `lastMessagePreview` is the newest message body, or `null` when no messages
  have been sent.
- `latestMessageAt` is the newest message timestamp, or `null` when no messages
  have been sent.
- `unreadCount` counts messages sent by the other user after the authenticated
  user's last read timestamp.
- `hasUnread` is `true` when `unreadCount` is greater than zero.

### Mark Conversation Read

`POST /api/conversations/:conversationId/read`

- Auth required.
- Only users who own one of the matched pets can mark a conversation as read.
- Marks all messages currently in the conversation as read for the authenticated
  user.
- Request body may be omitted or an empty JSON object.
- Returns `404` when the conversation does not exist or is not accessible to the
  authenticated user.
- Response:

```json
{
  "conversationId": "conversation_id",
  "matchId": "match_id",
  "lastReadAt": "2026-04-23T00:00:00.000Z",
  "lastReadMessageId": "message_id",
  "unreadCount": 0,
  "hasUnread": false
}
```

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
