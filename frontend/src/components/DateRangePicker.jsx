import * as React from "react"
import { addDays, format } from "date-fns"
import { de } from "date-fns/locale" // Deutsches Datumsformat
import { Calendar as CalendarIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangePicker({ className, date, setDate }) {
  // State um zu prüfen, ob wir auf Mobile sind
  const [isMobile, setIsMobile] = React.useState(false)

  // Bildschirmgröße überwachen
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px ist der Standard Breakpoint für "md"
    }
    
    // Initial prüfen
    checkMobile()
    
    // Bei Resize neu prüfen
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              // 1. BASIS LAYOUT
              "w-full justify-start text-left font-normal",
              
              // 2. HÖHE (48px)
              "h-12", 
              
              // 3. ECKEN (4px)
              "rounded", 

              "border-border-default",

              // 4. FOCUS STYLE (Teal)
              // Wir müssen 'focus-visible' nutzen für Tastatur/Klick-Focus
              // ring-offset-0 verhindert den weißen Abstand zwischen Button und Ring
              "focus-visible:border-brand-teal focus-visible:ring-brand-teal",
              
              // Optional: Falls du den Standard-Ring dicker/dünner willst:
              // "focus-visible:ring-1",

              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon size={20} className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd.MM.yyyy", { locale: de })} -{" "}
                  {format(date.to, "dd.MM.yyyy", { locale: de })}
                </>
              ) : (
                format(date.from, "dd.MM.yyyy", { locale: de })
              )
            ) : (
              <span>Zeitraum wählen</span>
            )}
          </Button>
        </PopoverTrigger>
        
        {/* align="start" sorgt dafür, dass es linksbündig aufgeht.
            w-auto passt sich dem Inhalt an. */}
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            // HIER IST DER TRICK: 1 Monat auf Mobile, 2 auf Desktop
            numberOfMonths={isMobile ? 1 : 2}
            locale={de}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}