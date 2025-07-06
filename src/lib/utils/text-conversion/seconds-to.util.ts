export const secondsToMinutes = (justSeconds: any, options: any) => {
  const minutes = Math.floor(justSeconds / 60)
  const seconds = justSeconds % 60
  function padTo2Digits(num: any) {
    return num.toString().padStart(2, "0")
  }
  const result = `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`
  return result
}
