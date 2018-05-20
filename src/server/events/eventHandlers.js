import { BlobsRepository } from '../gameState'
import { round } from '../../shared/util'
import { Events } from '../../shared/events'
import { createBlob } from '../models/blob'

const newPlayer = (digest) => data => {
  const player = BlobsRepository.find(data.id)
  digest.add(Events.NEW_PLAYER.with(player))
}

const removeHandler = (digest) => data => {
  const blob = BlobsRepository.find(data.id)
  if (blob) {
    BlobsRepository.remove(blob)
    digest.add(Events.REMOVE_PLAYER.with(data))
  }
}

const newBullet = (digest) => data => {
  console.log('we made it here')
  BlobsRepository.save(createBlob(data.location.x, data.location.y, 10, 30, data.direction)
  )
}

const directionHandler = (digest) => data => {
  const blob = BlobsRepository.find(data.id)
  if (blob) {
    blob.direction.x = data.direction.x
    blob.direction.y = data.direction.y
  }
}

const mouseClickHandler = (digest) => data => {
  const blob = BlobsRepository.find(data.id)
  if (blob) {
    const tempId = blob.id * 100 + 11
    console.log('got a click')
    newBullet(digest, {id: tempId, location: blob.location, direction: blob.lookDir})
  }
}

const mouseMoveHandler = (digest) => data => {
  const blob = BlobsRepository.find(data.id)
  if (blob) {
    blob.lookDir.x = data.direction.x
    blob.lookDir.y = data.direction.y
  }
}

const updateAll = (digest) => data => {
  BlobsRepository.forEach(blob => {
    if ((blob.direction.x != null) || (blob.direction.y != null)) {
      blob.location.x = round(blob.location.x + blob.direction.x * blob.speed, 2)
      blob.location.y = round(blob.location.y + blob.direction.y * blob.speed, 2)
      digest.add(Events.PLAYER_MOVE.with({
        id: blob.id,
        location: blob.location
      }))
    }
  })
}

const chat = (digest, db) => data => {
  if (data.content.includes('/boops:new')) {
    const name = data.content.split(' ')[1]
    db.Boop.sync()
      .then(() => db.Boop.create({name: name}))
      .then(boop => digest.add(Events.CHAT.with({
        from: 'SERVER',
        content: 'Created boop'
      })))
      .catch(error => console.log(error))
  } else if (data.content === '/boops:list') {
    db.Boop.findAll()
      .then(users => digest.add(Events.CHAT.with({
        from: 'SERVER',
        content: users
          .map(user => user.getDataValue('name'))
          .join(', ')
      })))
  }

  digest.add(Events.CHAT.with(data))
}

const setupHandler = (event, handler) => (eventBus, digest, db) => {
  eventBus.get(event).subscribe(handler(digest, db))
}

export const eventHandlerSetups = [
  setupHandler(Events.NEW_PLAYER, newPlayer),
  setupHandler(Events.NEW_BULLET, newBullet),
  setupHandler(Events.REMOVE_PLAYER, removeHandler),
  setupHandler(Events.UPDATE_DIRECTION, directionHandler),
  setupHandler(Events.MOUSE_CLICK, mouseClickHandler),
  setupHandler(Events.MOUSE_MOVE, mouseMoveHandler),
  setupHandler(Events.CHAT, chat),
  setupHandler(Events.UPDATE_ALL, updateAll)
]
