import deep from '@cookiex/deep'

const isSetStateArgFunction = <S>( value: any ): value is ( state: S ) => State.SetStateArgRest<S> =>
  typeof value === 'function'

abstract class State<S> {
  private __subscriptions: ( ( state: S ) => void )[] = []
  public abstract state: S
  public setState = ( state: State.SetStateArg<S> ): this => {
    if ( this.state === state ) return this
    if ( isSetStateArgFunction<S>( state ) )
      return this.setState( state( this.state ) )

    if ( typeof state === 'object' && !Array.isArray( state ) )

      this.state = deep( this.state, state )

    else this.state = state as S

    this.__subscriptions.forEach( observer => observer( this.state ) )

    return this
  }
  public subscribe = ( observer: ( state: S ) => void ) => {
    this.__subscriptions.push( observer )
    return this
  }
  public unsubscribe = ( observer: ( state: S ) => void ) => {
    this.__subscriptions.splice( this.__subscriptions.indexOf( observer ), 1 )
    return this
  }
}

namespace State {
  export type DeepPartial<T extends object> = {
    [K in keyof T]:
      T[K] extends any[] ? T[K] :
      T[K] extends object ? DeepPartial<T[K]> :
      T[K]
  }
  export type SetStateArgRest<S> =
    S extends object ? S extends any[] ? S : deep.Partial<S> : S
  export type SetStateArg<S> =
    | ( ( state: S ) => SetStateArgRest<S> )
    | SetStateArgRest<S>
}

export default State
