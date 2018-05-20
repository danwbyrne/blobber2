
export function Event (type) {
  return {
    type,
    with (data) {
      return {
        type: this.type,
        data: data
      }
    }
  }
}

export const Events = {
  UPDATE_DIRECTION: Event('ud'),
  CHAT: Event('ch'),
  MOUSE_MOVE: Event('mm'),
  MOUSE_CLICK: Event('mc'),
  PLAYER_MOVE: Event('pm'),
  NEW_PLAYER: Event('np'),
  NEW_BULLET: Event('nb'),
  REMOVE_PLAYER: Event('rp'),
  REMOVE_BULLET: Event('rb'),
  UPDATE_ALL: Event('updateAll'),
  INIT: Event('init')
}
