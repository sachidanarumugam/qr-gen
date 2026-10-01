import { Component } from 'react'

// Error boundaries must be class components. qrcode.react throws while rendering
// when the data does not fit in any QR version, which would otherwise unmount the whole app.
export default class QRErrorBoundary extends Component {
  state = { failed: false, resetKey: this.props.resetKey }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  // Try again whenever the inputs that affect encoding change.
  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) return { failed: false, resetKey: props.resetKey }
    return null
  }

  componentDidCatch() {
    this.props.onFailure?.(true)
  }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.failed && !this.state.failed) this.props.onFailure?.(false)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
