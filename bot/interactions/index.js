exports.interactionHandler = (client) => {
  [
    require('./link'),
    require('./linkModal'),
    require('./log'),
    require('./purchase')
  ]
  .map(interRegFn => interRegFn(client))
}
