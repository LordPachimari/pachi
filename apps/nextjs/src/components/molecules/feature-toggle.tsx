import React from "react";

import { CommonStore } from "~/zustand/common";

export type FeatureToggleProps = {
  featureFlag: string;
  showOnlyWhenDisabled?: boolean;
  children?: React.ReactNode;
};

const FeatureToggle: React.FC<FeatureToggleProps> = ({
  featureFlag,
  showOnlyWhenDisabled = false,
  children,
}) => {
  const isFeatureEnabled = CommonStore((state) => state.isFeatureEnabled);

  const showContent = isFeatureEnabled(featureFlag) === !showOnlyWhenDisabled;
  return showContent ? <>{children}</> : null;
};

export default FeatureToggle;
