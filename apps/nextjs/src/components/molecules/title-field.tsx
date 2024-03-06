import TextareaAutosize from 'react-textarea-autosize'

import type { ProductUpdates } from '@pachi/db'
import type { FieldError as FieldErrorType } from '@pachi/types'

import type { DebouncedFunc } from '~/types'

export interface TitleProps {
  onChange: DebouncedFunc<
    ({ updates }: { updates: ProductUpdates }) => Promise<void>
  >
  value?: string
  placeholder?: string
  error: FieldErrorType
}

const TitleField = ({ onChange, value, placeholder, error }: TitleProps) => {
  return (
    <div className=" mr-0 w-full border-red-100 ">
      <TextareaAutosize
        id="title"
        defaultValue={value}
        placeholder={placeholder ?? 'Write title...'}
        onInput={async (e) =>
          await onChange({ updates: { title: e.currentTarget.value } })
        }
        className="w-full resize-none appearance-none overflow-hidden rounded-md bg-transparent text-2xl font-bold focus:outline-none"
      />
      {/* <FieldError error={error.error} message={error.message} /> */}
    </div>
  )
}

export default TitleField
