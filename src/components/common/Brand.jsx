export function Brand({ className = 'w-20', decorative = false }) {
  return (
    <img
      src={import.meta.env.BASE_URL + 'images/tallios-logo.png'}
      alt={decorative ? '' : 'Tallio’s Coffee & Tea Co.'}
      className={'block h-auto ' + className}
    />
  )
}
