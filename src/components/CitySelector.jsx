import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'

/**
 * CitySelector - Combobox for switching between cities (shadcn/ui).
 *
 * @param {Object} props
 * @param {Array<{id: string, name: string}>} props.cities - List of city objects
 * @param {string} props.value - Currently selected city ID (controlled)
 * @param {function(string): void} props.onChange - Called when selection changes, receives new city ID
 * @param {string} [props.placeholder='Select city'] - Placeholder text
 * @param {string} [props.className] - Additional CSS class for the wrapper
 */
export default function CitySelector({
  cities,
  value,
  onChange,
  placeholder = 'Select city',
  className = '',
}) {
  const selectedCity = cities.find((c) => c.id === value) ?? null

  return (
    <div className={`city-selector ${className}`.trim()}>
      <Combobox
        items={cities}
        value={selectedCity}
        onValueChange={(city) => onChange(city?.id ?? '')}
        itemToStringValue={(city) => city?.id ?? ''}
        itemToStringLabel={(city) => city?.name ?? ''}
      >
        <ComboboxInput
          placeholder={placeholder}
          showClear={false}
        />
        <ComboboxContent>
          <ComboboxEmpty>No city found.</ComboboxEmpty>
          <ComboboxList>
            {(city) => (
              <ComboboxItem key={city.id} value={city}>
                {city.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
