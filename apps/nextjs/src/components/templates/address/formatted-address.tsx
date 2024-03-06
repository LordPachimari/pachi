import type { Address } from '@pachi/db'

type FormattedAddressProps = {
  title: string
  addr?: Address
}

export const FormattedAddress = ({ title, addr }: FormattedAddressProps) => {
  if (!addr) {
    return (
      <div className="flex flex-col pl-6">
        <div className="inter-small-regular text-grey-50 mb-1">{title}</div>
        <div className="inter-small-regular flex flex-col">N/A</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pl-6">
      <div className="inter-small-regular text-grey-50 mb-1">{title}</div>
      <div className="inter-small-regular flex flex-col">
        <span>{addr?.address}</span>
        <span>
          {addr?.postalCode} {addr?.city}
          {', '}
          {addr?.province ? `${addr.province} ` : ''}
          {addr?.countryCode?.toUpperCase()}
        </span>
      </div>
    </div>
  )
}
