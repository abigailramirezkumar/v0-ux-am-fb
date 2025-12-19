"use client"

import { useState } from "react"
import { Input } from "@/components/input"
import { Textarea } from "@/components/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/radio"
import { Checkbox } from "@/components/checkbox"
import { Select, SelectItem } from "@/components/select"
import { Slider } from "@/components/slider"
import { DatePicker } from "@/components/date-picker"
import { SelectionCard, SelectionCardGroup } from "@/components/selection-card"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function FormsPage() {
  const [radioValue, setRadioValue] = useState("option1")
  const [checkboxStates, setCheckboxStates] = useState({
    checkbox1: false,
    checkbox2: true,
    checkbox3: false,
  })
  const [selectValue, setSelectValue] = useState("")
  const [selectErrorValue, setSelectErrorValue] = useState("")
  const [sliderValue, setSliderValue] = useState([50])
  const [rangeSliderValue, setRangeSliderValue] = useState([25, 75])
  const [dateValue, setDateValue] = useState<Date | undefined>()
  const [dateErrorValue, setDateErrorValue] = useState<Date | undefined>()
  const [selectedCards, setSelectedCards] = useState<string[]>(["card2"])

  return (
    <div className="space-y-8 bg-sidebar min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Forms</h1>
        <p className="text-muted-foreground">
          Form input components including text inputs, selects, radio buttons, and checkboxes
        </p>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Text Inputs</CardTitle>
          <CardDescription>Basic text input fields with labels and error states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input label="Label" placeholder="Text" required />
            </div>
            <div>
              <Input label="Label" placeholder="Text" required error="Help Text" hasError />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Text Area</CardTitle>
          <CardDescription>Multi-line text input fields for longer content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Textarea label="Label" placeholder="Text" required rows={3} />
            </div>
            <div>
              <Textarea label="Label" placeholder="Text" required error="Help Text" hasError rows={3} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Select</CardTitle>
          <CardDescription>Dropdown selection components with options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select
                label="Label"
                placeholder="Select an option"
                required
                value={selectValue}
                onValueChange={setSelectValue}
              >
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </Select>
            </div>
            <div>
              <Select
                label="Label"
                placeholder="Select an option"
                required
                error="Help Text"
                hasError
                value={selectErrorValue}
                onValueChange={setSelectErrorValue}
              >
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Date Picker</CardTitle>
          <CardDescription>Date selection components with calendar interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DatePicker label="Date" placeholder="Select a date" value={dateValue} onChange={setDateValue} />
            </div>
            <div>
              <DatePicker
                label="Date"
                placeholder="Select a date"
                value={dateErrorValue}
                onChange={setDateErrorValue}
                error="Please select a valid date"
                hasError
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Sliders</CardTitle>
          <CardDescription>Range and value selection sliders with various configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Slider
                label="Single Value Slider"
                value={sliderValue}
                onValueChange={setSliderValue}
                min={0}
                max={100}
                step={1}
              />
              <p className="text-sm text-muted-foreground mt-2">Value: {sliderValue[0]}</p>
            </div>
            <div>
              <Slider
                label="Range Slider"
                value={rangeSliderValue}
                onValueChange={setRangeSliderValue}
                min={0}
                max={100}
                step={1}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Range: {rangeSliderValue[0]} - {rangeSliderValue[1]}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Slider label="Disabled Slider" defaultValue={[30]} min={0} max={100} step={1} disabled />
            </div>
            <div>
              <Slider
                label="Slider with Error"
                defaultValue={[80]}
                min={0}
                max={100}
                step={1}
                error="Value is too high"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Radio Buttons & Checkboxes</CardTitle>
          <CardDescription>Selection controls for single and multiple choice options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Radio Buttons</h3>
              <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                <RadioGroupItem value="option1" label="Label" />
                <RadioGroupItem value="option2" label="Label" />
              </RadioGroup>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Checkboxes</h3>
              <div className="space-y-3">
                <Checkbox
                  checked={checkboxStates.checkbox1}
                  onCheckedChange={(checked) =>
                    setCheckboxStates((prev) => ({ ...prev, checkbox1: checked as boolean }))
                  }
                  label="Label"
                />
                <Checkbox
                  checked={checkboxStates.checkbox2}
                  onCheckedChange={(checked) =>
                    setCheckboxStates((prev) => ({ ...prev, checkbox2: checked as boolean }))
                  }
                  label="Label"
                />
                <Checkbox
                  checked={checkboxStates.checkbox3}
                  onCheckedChange={(checked) =>
                    setCheckboxStates((prev) => ({ ...prev, checkbox3: checked as boolean }))
                  }
                  label="Label"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Selection Cards</CardTitle>
          <CardDescription>Card-based selection components that function like checkbox groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <SelectionCardGroup value={selectedCards} onChange={setSelectedCards}>
              <SelectionCard id="card1">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Option 1</h3>
                  <p className="text-sm text-muted-foreground">
                    This is placeholder content for the first selection card option.
                  </p>
                </div>
              </SelectionCard>
              <SelectionCard id="card2">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Option 2</h3>
                  <p className="text-sm text-muted-foreground">
                    This is placeholder content for the second selection card option.
                  </p>
                </div>
              </SelectionCard>
              <SelectionCard id="card3">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Option 3</h3>
                  <p className="text-sm text-muted-foreground">
                    This is placeholder content for the third selection card option.
                  </p>
                </div>
              </SelectionCard>
            </SelectionCardGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
