# Resource Manager 9000

An opinionated functional React sample application.

## Building

```bash
# building docs/
NODE_ENV=production yarn build
```

## Running

```bash
yarn start
```

### Running Tests

```bash
# see below
yarn e2e
```

## Project Structure

This project takes the stance that _all_ state belongs in the Redux store, the Redux store is a global entity that belongs to no individual component, that components should not contain their own state, and that components should not trigger effects as part of their render lifecycle. The primary benefit of these constraints is that the components become as simple as possible, and a greater percentage of the functions (and component functions) contained with the project are "pure", and thus easier to develop, test, and maintain. 

The following are the bits of noteworthy plumbing make that possible:

### hooks

The following hooks (and pseudo hooks) were written with the goal of mixing stateful defaults into a component's `props` when a context is present. This optionality allows the components to be unit tested purely in isolation without the need to set up any sort of prior environment or context, and by default the components will then always be a function of their `props`.

As of the time of this writing, [react-redux] throws an exception if an attempt is made to get the `ReduxContext`, and there's no ancestor `Provider` to provide it. This is a massive design oversight, and forces components to always have a provider, even in a unit testing context, where a carefully written component may be able to operate off of just it's `props`, and gracefully handle a lack of context.

So with that in mind, this project chose to write it's own barebones alternative to [react-redux] as an experiment. See [useSubscription] and [ReduxContext].

* [useDefaults]*   
  An alternative to `defaultProps` that works well with a chain of composed hooks. See components below for an example. If the composed hook chain in each of this project's components were instead provided as a higher-order component API, this utility would be wholly unnecessary, as a better option would be to just use Javascript's native support for default parameters.

* [useHandlers]  
  The provided event handlers will have the special properties `$context`, `$dispatch`, and `$getState` injected into their first argument (the `Event` object). `$getState` gives the handler access to the application's current state, `$dispatch` allows the handler to dispatch actions to modify the state of the application, and `$context` gives the handlers a global "scratch pad" to store things like promise handles, timeout IDs, and other types of non-state objects.

  An important design goal of this project was to constrain effects to being solely the province of event handlers, and to remove effects from the components and the state manager. The above additions to the event object are enough for an individual handler to act as it's own separate "main" routine that operates on the global Redux store and uses DOM APIs to produce effects (that may result in further mutations to the store).

* [usePropsSelector]  
  A wrapper around `useSelector` that defaults to shallow object equality for testing whether a component needs to re-render or not. 

* [useSelector]  
  Subscribes to updates from the Redux store, and forces the component to re-render if the selector's returned value doesn't compare equal to the previous returned value.

* [useSubscription]  
  Low-level API for tying effects (such as component re-rendering) to Redux store updates. See [ReduxContext] for more information.

* [useT]  
  Injects a special property, `$t`, into props that lets the component look up translated messages by key.

* [useUid]*  
  Injects a unique integer ID into props, to be used in generating unique ID attributes and other similar purposes.

\* Pseudo-hook. Not actually dependent on the React hooks API.

See below for usage examples.

### utils

#### [utils/redux]

Rather than using Redux Toolkit and routines like `createSlice` and `combineReducers` this project chose a conceptually simpler, and hopefully cleaner, API for composing together the root reducer and exposing action creators.

This amounts to combining separate reducers together into a reducer that contains a big switch/case statement, and then using the amazing [immer] to ensure the reducer always returns a new state.

* `reducer(actionType, reducerFn)`
  Returns a new reducer with the provided function automatically wrapped in immer's `produce` that handles actions of the provided type, a map of the provided action type to action creator, and a map containing the original reducer function for later composition through `caseReducers`.

* `caseReducers(...reducers)`
  Combines together two reducers created through either `caseReducers` or `reducer` to form a new reducer by merging the provided reducers together. The net result ends up being a reducer that routes the action type to it's appropriate reducer.

### components

* [ReduxContext]  
  This is a lightweight alternative to [react-redux]'s ReduxContext that makes use of the fact that Javascript's `Map` type is insertion ordered, and can then be used as an alternative to [react-redux]'s doubly linked list approach to maintaining a list of subscribers.

* [EmployeeFields]  
  The net effect of all of the above design decisions is that components can be automatically written to allow `props` to override any defaults provided by hooks that do things like selecting properties from the store, or providing default handlers that automatically get Redux store functions injected into the event object. 

  Because of this, components are pure functions by default, and only become stateful when there's an ancestor context that provides a Redux store. This greatly simplifies development, maintenance, and testing of React components.

* [AppHeader]  
  The next logical step after establishing that hooks should only operate on props is to then move that composed hook pipeline out into a higher order component, such as `ApplyToProps`.
  
  This removes the need for pseudo-hooks like `useDefaults`, as destructured paramters with default values can be used instead. In `AppHeader`, `useUid` and `useHandlers` provide the prop-overridable defaults for `$uid` and `onDropdownKeyUp`, and props `itemIdFn` and `renderFn` get their default values through Javascript's default parameters mechanism.

  This also simplifies the code within the actual component function itself. With this change it's clear that the component really is a function of it's `props`, and nothing more. 


### test/e2e

TODO

[react-redux]: https://react-redux.js.org/

[useDefaults]: ./src/hooks/useDefaults.js
[useHandlers]: ./src/hooks/useHandlers.js
[usePropsSelector]: ./src/hooks/usePropsSelector.js
[useSelector]: ./src/hooks/useSelector.js
[useSubscription]: ./src/hooks/useSubscription.js
[useT]: ./src/hooks/useT.js
[useUid]: ./src/hooks/useUid.js

[ReduxContext]: ./src/components/ReduxContext.jsx
[EmployeeFields]: ./src/components/EmployeeFields.jsx
[AppHeader]: ./src/components/AppHeader.jsx

[utils/redux]: ./src/utils/redux.js

