function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Food Log</h1>
      
      <div className="text-center">
        <p className="text-gray-600 mb-8">食事記録を追加しましょう</p>
        
        <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <span className="mr-2">+</span>
          新しい記録を追加
        </button>
      </div>
    </div>
  )
}

export default HomePage