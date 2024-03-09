export type UploadData = {
  key: string
  url: string
  name: string
  size: number
}

export type UploadError = {
  code: string
  message: string
  data: any
}
export type UploadFileResponse =
  | { data: UploadData; error: null }
  | { data: null; error: UploadError }
