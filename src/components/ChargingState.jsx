import { useState, useEffect } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

function ChargingState({ drone }) {
  const [chargeProgress, setChargeProgress] = useState(drone?.battery ?? 0)

  useEffect(() => {
    if (chargeProgress >= 100) return
    const interval = setInterval(() => {
      setChargeProgress((prev) => Math.min(prev + 2, 100))
    }, 300)
    return () => clearInterval(interval)
  }, [chargeProgress])

  const isComplete = chargeProgress >= 100

  return (
    <DialogContent showCloseButton={!isComplete}>
      <DialogHeader>
        <DialogTitle>
          {isComplete ? `${drone?.name} fully charged` : `Charging ${drone?.name}`}
        </DialogTitle>
        <DialogDescription>
          {isComplete
            ? 'Battery is at 100%. Your drone is ready for the next flight.'
            : `Charging in progress... Current level: ${chargeProgress}%`}
        </DialogDescription>
      </DialogHeader>

      <div className="charging-progress">
        <div className="charging-progress-track">
          <div
            className="charging-progress-fill"
            style={{ width: `${chargeProgress}%` }}
          />
        </div>
        <p className="text-sm font-semibold text-foreground">{chargeProgress}%</p>
      </div>

      <DialogFooter>
        {isComplete && (
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        )}
      </DialogFooter>
    </DialogContent>
  )
}

export default ChargingState
