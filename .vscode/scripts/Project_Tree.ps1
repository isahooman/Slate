$output_file = "structure.md"
$project_root = (Get-Location).Path

function list_files($indent, $path) {
    $directories = Get-ChildItem $path -Directory | Where-Object { $_.Name -ne "node_modules" }

    foreach ($directory in $directories) {
        Add-Content $output_file "$indent- [$($directory.Name)]"
        list_files "$indent  " $directory.FullName
    }

    $files = Get-ChildItem $path -File | Where-Object { $_.FullName -notlike "*node_modules*" }
    foreach ($file in $files) {
        $size = $file.Length
        $sizeKB = [math]::Round($size / 1KB, 2)
        Add-Content $output_file "$indent- $($file.Name) ($sizeKB KB)"
    }
}

Set-Content $output_file ""
list_files "" $project_root