@php
    /** @var array<int, array{label: string, value: string}> $rows */
    $rows = $rows ?? [];
@endphp
@foreach ($rows as $index => $row)
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"@if(!$loop->last) style="margin-bottom:12px;"@endif>
        <tr>
            <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#9a9084; padding-bottom:4px;">
                {{ $row['label'] }}
            </td>
        </tr>
        <tr>
            <td style="font-family: Georgia, 'Times New Roman', Times, serif; font-size:16px; line-height:1.4; color:#12100c;">
                {{ $row['value'] }}
            </td>
        </tr>
    </table>
@endforeach
