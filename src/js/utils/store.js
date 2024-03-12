import LocalForage from "../../../vendor/localforage.mjs.js";

const appName = 'PG-Viewer'
// const defaultType = 'local'  // 'local' || 'session'

LocalForage.config({
  name: appName,
});

// function _serialize(obj) {
//   return JSON.stringify(obj)
// }

// function _deserialize(str, defaultVal = null) {
//   if (!str) return defaultVal
//   let val = null
//   try {
//     val = JSON.parse(str)
//   } catch (e) {
//     val = str
//   }
//   return val || defaultVal
// }

// function getLocal(key) {
//   return _deserialize(localStorage.getItem(`${appName}:${key}`))
// }

// function getSession(key) {
//   return _deserialize(sessionStorage.getItem(`${appName}:${key}`))
// }

// function getItem(key, type) {
//   if (type === 'local') {
//     getLocal(key)
//   } else if (type === 'session') {
//     getSession(key)
//   } else {
//     return getLocal(key) || getSession(key)
//   }
// }

// function setLocal(key, value) {
//   if (value != undefined) {
//     localStorage.setItem(`${appName}:${key}`, _serialize(value))
//     // console.log(`存储成功！值为${getLocal(key)}`)
//   }
// }

// function setSession(key, value) {
//   if (value != undefined) {
//     sessionStorage.setItem(`${appName}:${key}`, _serialize(value))
//   }
// }

// function setItem(key, value, type=defaultType) {
//   if (type === 'local') {
//     setLocal(key, value)
//   } else if (type === 'session') {
//     setSession(key, value)
//   } else {
//     console.log('type 必须为 local或session')
//   }
// }

// function removeLocal(key) {
//   return localStorage.removeItem(`${appName}:${key}`)
// }

// function removeSession(key) {
//   return sessionStorage.removeItem(`${appName}:${key}`)
// }

// function removeItem(key, value, type=defaultType) {
//   if (type === 'local') {
//     removeLocal(key, value)
//   } else if (type === 'session') {
//     removeSession(key, value)
//   } else {
//     console.log('type 必须为 local或session')
//   }
// }


export default {
  setItem: LocalForage.setItem,
  getItem: LocalForage.getItem,
  removeItem: LocalForage.removeItem,
  clear: LocalForage.clear,
  length: LocalForage.length,
  key: LocalForage.key,
  keys: LocalForage.keys,
  iterate: LocalForage.iterate,
}

