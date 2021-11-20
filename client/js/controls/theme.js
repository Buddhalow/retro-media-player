
    export default class SPThemeElement extends HTMLElement {
        addField(id, label, type, change) {
        
            this[id + 'Label'] = document.createElement('label');
            this[id + 'Label'].innerHTML = label;
            this[id + 'Input'] = document.createElement('input');
            this.appendChild(this[id + 'Label']);
            this.appendChild(this[id + 'Input']);
            this[id + 'Input'].setAttribute('type', type);
            this[id + 'Input'].setAttribute('id', id);
        }
        get theme() {
            let flavor = this.flavorselect.options[this.flavorselect.selectedIndex].value;
            let stylesheet = this.styleselect.options[this.styleselect.selectedIndex].value;
            return {
                saturation: this.saturationChooser.value,
                hue: this.colorChooser.value,
                colors: [this.primaryColorInput.value, this.secondaryColorInput.value, this.tertiaryColorInput.value],
                stylesheet: stylesheet,
                flavor: flavor
            };
        }
        setColorTheme(value) {
            this.saturationChooser.setAttribute('value', value.saturation);
            this.colorChooser.setAttribute('value', value.hue);
            this.primaryColorInput.value = value.colors[0];
            this.secondaryColorInput.value = value.colors[1];
            this.tertiaryColorInput.value = value.colors[2];
        }
        set theme(value) {
            this.setColorTheme(value);
            fetch('/api/theme', {
                credentials: "same-origin"
            }).then((response) => response.json()).then((result) => {
                result.objects.map((o) => {
                    let option = document.createElement('option');
                    option.setAttribute('value', o.id);
                    if (o.id == value.stylesheet) {
                        option.setAttribute('selected', 'selected');
                    }
                    option.innerHTML = _e(o.name);
                    this.styleselect.appendChild(option);
                });
            });
            $(this.flavorselect).val(value.flavor)
            
        }
        
        
        
        connectedCallback() {
            if (this.created2) {
                return
            }
            this.style.display = 'flex';
            this.style.flexDirection = 'column';
            this.colorChooser = document.createElement('input');
            this.colorChooser.setAttribute('type', 'range');
            this.colorChooser.addEventListener('mousedown', (e) => {
                this.colorChooser.isDragging = true;
            })
            this.colorChooser.addEventListener('mouseup', (e) => {
                this.colorChooser.isDragging = true;
            })
            this.colorChooser.addEventListener('mousemove', (e) => {
                if (this.colorChooser.isDragging) {
                    let evt = new CustomEvent('drag');
                    this.dispatchEvent(evt);
                }
            })
            this.colorChooser.addEventListener('change', (e) => {
                let evt = new CustomEvent('change');
                this.dispatchEvent(evt);
            })
            this.innerHTML += '<label>' + _('Accent color') + '</label>';
            this.appendChild(this.colorChooser);
            this.colorChooser.setAttribute('max', 360);
            this.saturationChooser = document.createElement('input');
            this.saturationChooser.setAttribute('type', 'range');
            this.label = document.createElement('label');
            this.label.innerHTML = _('Saturation');
            this.appendChild(this.saturationChooser);
            this.appendChild(this.label);
            this.saturationChooser.setAttribute('max', 360);
            
            this.styleselect = document.createElement('select');
            this.appendChild(this.styleselect);
            this.styleselect.innerHTML = '<option value="">Select a theme</option>';
            this.flavorselect = document.createElement('select');
            this.flavorselect.innerHTML = '<option value="">Select a flavor</option>';
            this.flavorselect.innerHTML += '<option value="dark">' + _e('Dark') + '</option><option value="light">' + _e('Light') + '</option>';
            
            this.appendChild(this.flavorselect);
      
            this.addField('primaryColor', _e('Primary color'), 'color');
            this.addField('secondaryColor', _e('Secondary color'), 'color');
            this.addField('tertiaryColor', _e('Tertiary color'), 'color');
            this.created2 = true;

            
        }
    }
