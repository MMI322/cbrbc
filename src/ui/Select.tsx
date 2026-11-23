import * as SelectPrimitive from '@radix-ui/react-select';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
}

export function Select({ id, value, options, onValueChange }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger id={id} className="ui-select-trigger" data-slot="select-trigger">
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild><span className="ui-select-chevron" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={5} collisionPadding={8}
          className="ui-select-content" data-slot="select-content">
          <SelectPrimitive.ScrollUpButton className="ui-select-scroll">
            <span className="ui-select-chevron" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="ui-select-viewport">
            {options.map(option => (
              <SelectPrimitive.Item key={option.value} value={option.value} className="ui-select-item">
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ui-select-check" />
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="ui-select-scroll">
            <span className="ui-select-chevron" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
