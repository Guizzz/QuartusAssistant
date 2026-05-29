
export function getIcon(text: string): string
{
    let icon = 'symbol-variable';

        switch (text)
        {
            case 'signal':
                icon = 'symbol-variable';
                break;

            case 'variable':
                icon = 'symbol-field';
                break;

            case 'constant':
                icon = 'symbol-constant';
                break;

            case 'port':
                icon = 'symbol-interface';
                break;
        }
    return icon;
}