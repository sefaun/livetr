export function useDragDrop() {
  function dragstart(event: DragEvent): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('item', (event.target as EventTarget & { id: string }).id)
    }
  }

  function dragenter(_event: DragEvent): void {}

  function dragover(_event: DragEvent): void {}

  function dragleave(_event: DragEvent): void {}

  function drop(event: DragEvent): void {
    if (event.dataTransfer) {
      const item = event.dataTransfer.getData('item')
      console.log(event.offsetX, event.offsetY)
      // {
      //   x: event.offsetX,
      //   y: event.offsetY,
      // },
    }
  }
  return {
    dragstart,
    dragenter,
    dragover,
    dragleave,
    drop,
  }
}
