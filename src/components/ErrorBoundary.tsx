import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">!</div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">読み込みエラー</h1>
            <p className="text-gray-500 text-sm mb-4">
              アプリの起動に失敗しました。Vercelの環境変数が正しく設定されているか確認してください。
            </p>
            <div className="bg-gray-100 rounded-lg p-3 text-left text-xs text-gray-600 font-mono break-all">
              {this.state.error?.message}
            </div>
            <p className="text-gray-400 text-xs mt-4">
              Vercel Dashboard → Settings → Environment Variables で<br />
              <strong>VITE_SUPABASE_URL</strong> と <strong>VITE_SUPABASE_ANON_KEY</strong> を設定してください。
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
