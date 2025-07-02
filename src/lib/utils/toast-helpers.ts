import { toast as baseToast } from '@/components/ui/use-toast'

// Helper functions to provide a similar API to sonner
export const toast = {
  success: (message: string) => {
    baseToast({
      title: 'Succes',
      description: message,
    })
  },
  
  error: (message: string) => {
    baseToast({
      title: 'Fout',
      description: message,
      variant: 'destructive',
    })
  },
  
  info: (message: string) => {
    baseToast({
      title: 'Info',
      description: message,
    })
  },
  
  warning: (message: string) => {
    baseToast({
      title: 'Waarschuwing',
      description: message,
      variant: 'destructive',
    })
  },
  
  loading: (message: string) => {
    baseToast({
      title: 'Bezig...',
      description: message,
    })
  },
}

// Re-export the base toast for custom usage
export { baseToast }