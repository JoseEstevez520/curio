import { useChatStore } from '../app/store';
import Segmented from './Segmented';

const OPTIONS = [
  { value: false, label: 'Off' },
  { value: true, label: 'Img' },
];

/**
 * Click-an-image-to-describe, on or off. Only rendered when the active model can see (the header
 * mounts it behind useModelSupportsVision), so it never shows for a text-only model. Same
 * monochrome segmented control as the other header toggles.
 */
export default function ImgToggle() {
  const describeImages = useChatStore((s) => s.describeImages);
  const setDescribeImages = useChatStore((s) => s.setDescribeImages);

  return (
    <Segmented
      id="seg-img"
      ariaLabel="Describe images"
      options={OPTIONS}
      value={describeImages}
      onChange={setDescribeImages}
    />
  );
}
