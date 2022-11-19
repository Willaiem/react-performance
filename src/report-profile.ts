// This module is just here for the exercise and doesn't actually do anything.
// In reality, what I would recommend for a function like this is that it keeps
// a queue of all updates and every 10 seconds it sends profile data to your
// server if there's any data in the queue.

import React from "react"

type ProfilerParams = Parameters<React.ProfilerOnRenderCallback>

type Profiler = {
  id: ProfilerParams[0], // the "id" prop of the Profiler tree that has just committed
  phase: ProfilerParams[1], // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration: ProfilerParams[2], // time spent rendering the committed update
  baseDuration: ProfilerParams[3], // estimated time to render the entire subtree without memoization
  startTime: ProfilerParams[4], // when React began rendering this update
  commitTime: ProfilerParams[5], // when React committed this update
  interactions: ProfilerParams[6], // the Set of interactions belonging to this update
}

// Then you presumably graph that data in Grafana or similar
let queue: ProfilerParams[] = []

// we're doing every 5 seconds so we don't have to wait forever...
// actual time may vary based on your app's needs
setInterval(sendProfileQueue, 5000)

const reportProfile: React.ProfilerOnRenderCallback = (...args) => {
  queue.push({ ...args })
  // this is a fire and forget, so we don't return anything.
}

function sendProfileQueue() {
  if (!queue.length) {
    return Promise.resolve()
  }
  const queueToSend = [...queue]
  queue = []
  console.info('sending profile queue', queueToSend)
  // here's where we'd actually make the server call to send the queueToSend
  // data to our backend... But we don't have a backend for this workshop so...
  return Promise.resolve()
}

export default reportProfile
