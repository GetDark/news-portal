export const metadata = { title: 'Контакты' }

export default function ContactsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-4xl mb-6">Контакты</h1>
      <p className="text-gray-600">
        По вопросам сотрудничества:{' '}
        <a href="mailto:news@swiftstream.ru" className="text-accent hover:underline">
          news@swiftstream.ru
        </a>
      </p>
    </div>
  )
}
