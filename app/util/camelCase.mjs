import _ from 'lodash'

function isPromise (obj) {
  return typeof obj.then === 'function'
}

export default function CamelCase (o) {
  if (!(o instanceof Object)) return o
  if (isPromise(o)) return o.then(CamelCase)
  if (_.isArrayLikeObject(o)) return _.map(o, CamelCase)
  if (!_.isDate(o) && _.isObjectLike(o)) return _(o).mapKeys((v, k) => _.camelCase(k)).mapValues(CamelCase).value()
  return o
}
