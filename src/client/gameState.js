import React, { Component } from 'react'
import './App.css'
import { ServerEvents } from './events/serverEvents'
import { SmolBlob } from './blobs/blob'
import { Bullet } from './blobs/bullet'
import { Events } from '../shared/events'
import { map } from 'rxjs/operators'

export class GameState extends Component {
  constructor () {
    super()

    this.state = {
      blobs: [],
      bullets: [],
      mainPlayerId: 0
    }
  }

  componentDidMount () {
    this.subscriptions = [
      ServerEvents.get(Events.INIT).subscribe(this.initialize)
    ]
  }

  componentWillUnmount () {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  initialize = data => {
    this.setState(prevState => ({
      blobs: data.blobs.filter(blob => blob.id !== data.id),
      mainPlayerId: data.id
    }))

    this.subscriptions.push(
      ServerEvents.get(Events.NEW_PLAYER)
        .subscribe(this.addPlayer(data.id)),
      ServerEvents.get(Events.REMOVE_PLAYER).pipe(
        map(event => event.id))
        .subscribe(this.removePlayer))

    this.subscriptions.push(
      ServerEvents.get(Events.NEW_BULLET)
        .subscribe(this.addBullet(data.id)),
      ServerEvents.get(Events.REMOVE_BULLET).pipe(
        map(event => event.id))
        .subscribe(this.removeBullet))
  }

  addPlayer = id => player => {
    this.setState(prevState => {
      let blobs = prevState.blobs

      if (player.id !== id) {
        blobs.push(player)
      }

      return {blobs}
    })
  }

  removePlayer = id => {
    this.setState(prevState => {
      const blob = prevState.blobs.find(blob => blob.id === id)
      if (blob) {
        const index = prevState.blobs.indexOf(blob)
        prevState.blobs.splice(index, 1)
        return {
          blobs: prevState.blobs
        }
      }
    })
  }

  addBullet = id => bullet => {
    this.setState(prevState => {
      let bullets = prevState.bullets

      bullets.push(bullet)

      return {bullets}
    })
  }

  removeBullet = id => {
    this.setState(prevState => {
      const bullet = prevState.bullets.find(bullet => bullet.id === id)
      if (bullet) {
        const index = prevState.bullet.indexOf(bullet)
        prevState.bullets.splice(index, 1)
        return {
          bullets: prevState.bullets
        }
      }
    })
  }

  render () {
    const players = this.state.blobs.map(blob => (
      <SmolBlob id={blob.id} location={blob.location} size={blob.size} />
    ))

    const bullets = this.state.bullets.map(bullet => (
      <Bullet id={bullet.id} location={bullet.location} size={bullet.size} />
    ))

    return (
      <div>
        {players}
        {bullets}
      </div>
    )
  }
}
