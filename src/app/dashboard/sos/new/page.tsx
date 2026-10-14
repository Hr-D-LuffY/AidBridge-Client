import type { Metadata } from 'next'
import { RaiseSosForm } from '@/features/sos/components/raise-sos-form'

export const metadata: Metadata = { title: 'Raise an SOS' }

export default function NewSosPage() {
  return <RaiseSosForm />
}
