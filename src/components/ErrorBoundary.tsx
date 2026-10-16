import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

// Catches render errors below it so one broken page doesn't blank the whole app
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div role="alert" className="page-message">
        <h1>Something went wrong</h1>
        <p>Sorry, this page couldn&apos;t be displayed. Try reloading.</p>
        <button type="button" className="btn btn--primary" onClick={() => location.reload()}>
          Reload page
        </button>
      </div>
    )
  }
}
