import React, { createContext, useContext } from "react";

// Define the props that TransitionGroup injects to its children
interface TransitionProps {
  in?: boolean;
  appear?: boolean;
  enter?: boolean;
  exit?: boolean;
  timeout?: number | { enter?: number; exit?: number; appear?: number };
  [key: string]: any;
}

// Create a context for transition props
const TransitionGroupContext = createContext<TransitionProps>({});

/**
 * Custom hook to access TransitionGroup props from context
 */
export const useTransitionGroupProps = () => useContext(TransitionGroupContext);

/**
 * Creates a childFactory function for TransitionGroup that
 * makes the transition props available through context
 */
export const useTransitionGroupChildFactory = () => {
  return (child: React.ReactElement) => {
    const { enter, exit, in: inProp, onExited } = child.props;
    const passableProps = {
      in: inProp,
      enter,
      exit,
      onExited,
    };

    return (
      <TransitionGroupContext.Provider key={child.key || child.props.id} value={passableProps}>
        {child}
      </TransitionGroupContext.Provider>
    );
  };
};
