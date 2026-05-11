"use client";

import { Component, type ReactNode } from "react";

interface CanvasErrorBoundaryProps {
  children: ReactNode;
}

interface CanvasErrorBoundaryState {
  error: Error | null;
}

class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  constructor(props: CanvasErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): CanvasErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error("Liveblocks canvas connection error", error);
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-bg-base px-6">
          <div className="max-w-md text-center">
            <h2 className="text-lg font-semibold tracking-normal text-copy-primary">
              Canvas connection lost
            </h2>
            <p className="mt-2 text-sm leading-6 text-copy-muted">
              We couldn&apos;t connect to the collaborative canvas. Check your
              network and try again.
            </p>
            <button
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-surface-border bg-bg-subtle px-4 py-2 text-sm font-medium text-copy-primary hover:bg-bg-surface"
              onClick={this.handleRetry}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { CanvasErrorBoundary };
