import { APIGate } from './connection'

export const getAccess = async (userId, parentType, parentId) => {
  return await APIGate.get(
    `/user/${userId}/${parentType}/${parentId}/access`
  )
}

export const appendActorToList = async (
  userId,
  parentType,
  parentId,
  listType,
  actors
) => {
  for (const actor of actors) {
    await APIGate.put(
      `/user/${userId}/${parentType}/${parentId}/access/${listType}`,
      { actor }
    )
  }
}

export const removeActorFromList = async (
  userId,
  parentType,
  parentId,
  listType,
  actors
) => {
  for (const actor of actors) {
    await APIGate.delete(
      `/user/${userId}/${parentType}/${parentId}/access/${listType}/${actor}`,
    )
  }
}

